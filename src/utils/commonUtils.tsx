export function getRandomLightColor() {
    const r = Math.floor(Math.random() * 100) + 155; // Random value between 155 and 255
    const g = Math.floor(Math.random() * 100) + 155;
    const b = Math.floor(Math.random() * 100) + 155;
    return `rgb(${r}, ${g}, ${b})`;
}
