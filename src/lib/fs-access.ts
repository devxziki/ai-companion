async function resolveFileHandle(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemFileHandle | null> {
  const parts = path.split("/").filter(Boolean);
  let dir = root;
  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    try {
      if (isLast) {
        return await dir.getFileHandle(parts[i]);
      }
      dir = await dir.getDirectoryHandle(parts[i]);
    } catch {
      return null;
    }
  }
  return null;
}

export async function pickDirectory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await window.showDirectoryPicker({ mode: "readwrite" });
  } catch {
    return null;
  }
}

export async function readFile(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<string | null> {
  try {
    const handle = await resolveFileHandle(root, path);
    if (!handle) return null;
    const file = await handle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

export async function writeFile(
  root: FileSystemDirectoryHandle,
  path: string,
  content: string,
): Promise<boolean> {
  try {
    const parts = path.split("/").filter(Boolean);
    const fileName = parts.pop()!;
    let dir = root;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: true });
    }
    const handle = await dir.getFileHandle(fileName, { create: true });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch {
    return false;
  }
}

export async function createDirectory(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<boolean> {
  try {
    const parts = path.split("/").filter(Boolean);
    let dir = root;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: true });
    }
    return true;
  } catch {
    return false;
  }
}

export async function listDirectory(
  root: FileSystemDirectoryHandle,
  path: string = "",
): Promise<{ name: string; kind: string; path: string }[]> {
  try {
    const dir = path
      ? (await resolveDirHandle(root, path))
      : root;
    if (!dir) return [];

    const entries: { name: string; kind: string; path: string }[] = [];
    const iter = dir.entries();
    let item = await iter.next();
    while (!item.done) {
      const [name, handle] = item.value;
      entries.push({ name, kind: handle.kind, path: path ? `${path}/${name}` : name });
      item = await iter.next();
    }
    entries.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return entries;
  } catch {
    return [];
  }
}

export async function readFileTree(
  root: FileSystemDirectoryHandle,
  path: string = "",
  depth: number = 0,
): Promise<string[]> {
  if (depth > 20) return [];
  try {
    const entries = await listDirectory(root, path);
    const result: string[] = [];
    for (const entry of entries) {
      const prefix = "  ".repeat(depth);
      result.push(`${prefix}${entry.kind === "directory" ? "📁" : "📄"} ${entry.name}`);
      if (entry.kind === "directory") {
        const children = await readFileTree(root, entry.path, depth + 1);
        result.push(...children);
      }
    }
    return result;
  } catch {
    return [];
  }
}

async function resolveDirHandle(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemDirectoryHandle | null> {
  const parts = path.split("/").filter(Boolean);
  let dir = root;
  try {
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part);
    }
    return dir;
  } catch {
    return null;
  }
}
