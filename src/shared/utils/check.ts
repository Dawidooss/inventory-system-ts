export default function check(condition: unknown, message: string): asserts condition {
	if (!condition) {
		warn(message);
		error(message);
	}
}
