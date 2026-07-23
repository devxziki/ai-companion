type FileEntry = {
  name: string;
  kind: "file" | "directory";
  path: string;
};

function joinPath(...parts: string[]): string {
  return parts.filter(Boolean).join("/").replace(/\/+/g, "/");
}

async function resolveHandle(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemFileHandle | FileSystemDirectoryHandle | null> {
  const parts = path.split("/").filter(Boolean);
  let handle: FileSystemDirectoryHandle | FileSystemFileHandle = root;
  for (let i = 0; i < parts.length; i++) {
    const isLast = i === parts.length - 1;
    try {
      if (isLast) {
        handle = await handle.getFileHandle(parts[i]);
      } else {
        handle = await handle.getDirectoryHandle(parts[i]);
      }
    } catch {
      return null;
    }
  }
  return handle;
}

export async function pickDirectory(): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await window.showDirectoryPicker({ mode: "readwrite" });
  } catch {
    return null;
  }
}

export async function requestDirPermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  try {
    if (handle.requestPermission) {
      const result = await handle.requestPermission({ mode: "read" });
      return result === "granted";
    }
    return true;
  } catch (e) {
    console.error("requestDirPermission error:", e);
    return false;
  }
}

export async function queryPermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  try {
    if (handle.queryPermission) {
      const result = await handle.queryPermission({ mode: "read" });
      return result === "granted";
    }
    return true;
  } catch {
    return true;
  }
}

export async function readFile(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<string | null> {
  try {
    const handle = await resolveHandle(root, path);
    if (!handle || handle.kind !== "file") return null;
    const file = await (handle as FileSystemFileHandle).getFile();
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

export async function deleteEntry(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<boolean> {
  try {
    const parts = path.split("/").filter(Boolean);
    const name = parts.pop()!;
    let dir = root;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part);
    }
    await dir.removeEntry(name, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export async function renameEntry(
  root: FileSystemDirectoryHandle,
  oldPath: string,
  newName: string,
): Promise<boolean> {
  try {
    const content = await readFile(root, oldPath);
    if (content === null) return false;
    const parts = oldPath.split("/").filter(Boolean);
    parts[parts.length - 1] = newName;
    const newPath = parts.join("/");
    const written = await writeFile(root, newPath, content);
    if (!written) return false;
    await deleteEntry(root, oldPath);
    return true;
  } catch {
    return false;
  }
}

export async function listDirectory(
  root: FileSystemDirectoryHandle,
  path: string = "",
): Promise<FileEntry[]> {
  try {
    const dir = path ? (await resolveHandle(root, path)) as FileSystemDirectoryHandle : root;
    if (!dir || dir.kind !== "directory") return [];

    const entries: FileEntry[] = [];

    if (typeof dir.entries === "function") {
      const iter = dir.entries();
      let item = await iter.next();
      while (!item.done) {
        const [name, handle] = item.value;
        entries.push({ name, kind: handle.kind, path: joinPath(path, name) });
        item = await iter.next();
      }
    } else {
      const nameIter = dir.keys();
      let item = await nameIter.next();
      while (!item.done) {
        const name = item.value;
        try {
          await dir.getDirectoryHandle(name);
          entries.push({ name, kind: "directory", path: joinPath(path, name) });
        } catch {
          entries.push({ name, kind: "file", path: joinPath(path, name) });
        }
        item = await nameIter.next();
      }
    }

    entries.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return entries;
  } catch (e) {
    console.error("listDirectory error:", e);
    return [];
  }
}

export async function readFileTree(
  root: FileSystemDirectoryHandle,
  path: string = "",
  depth: number = 0,
): Promise<FileEntry[]> {
  const maxDepth = 5;
  if (depth > maxDepth) return [];

  const entries = await listDirectory(root, path);
  const result: FileEntry[] = [];
  for (const entry of entries) {
    result.push(entry);
    if (entry.kind === "directory") {
      const children = await readFileTree(root, entry.path, depth + 1);
      result.push(...children);
    }
  }
  return result;
}

export function isFileSystemAccessSupported(): boolean {
  return "showDirectoryPicker" in window;
}
