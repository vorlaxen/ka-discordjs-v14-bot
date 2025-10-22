export function getAppEmoji(name: string, id: string, animated = false): string {
  return animated ? `<a:${name}:${id}>` : `<:${name}:${id}>`;
}