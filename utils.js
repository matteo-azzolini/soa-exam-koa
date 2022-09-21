export function getId(url) {
  const stringId = url.substring(url.lastIndexOf('/') + 1);
  const id = Number(stringId);
  return id;
}

export function generateId() {  
  const min = 100;
  const max = 999;

  return Math.floor(
    Math.random() * (max - min + 1) + min
  )
}
