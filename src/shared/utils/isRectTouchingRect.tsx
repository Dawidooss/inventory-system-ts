export default function isRectTouchingRect(
	rect1X: number,
	rect1Y: number,
	rect1Width: number,
	rect1Height: number,
	rect2X: number,
	rect2Y: number,
	rect2Width: number,
	rect2Height: number,
): boolean {
	const rect1Left = rect1X;
	const rect1Right = rect1X + rect1Width;
	const rect1Top = rect1Y;
	const rect1Bottom = rect1Y + rect1Height;

	const rect2Left = rect2X;
	const rect2Right = rect2X + rect2Width;
	const rect2Top = rect2Y;
	const rect2Bottom = rect2Y + rect2Height;

	return rect1Left < rect2Right && rect1Right > rect2Left && rect1Top < rect2Bottom && rect1Bottom > rect2Top;
}
