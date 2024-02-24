export default function isPointInRect(point: Vector2, rect: Vector2, size: Vector2): boolean {
	return point.X >= rect.X && point.X <= rect.X + size.X && point.Y >= rect.Y && point.Y <= rect.Y + size.Y;
}
