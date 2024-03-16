export default function createMotor(part0: BasePart, part1: BasePart, targetCFrame?: CFrame) {
	const motor = new Instance("Motor6D");
	motor.Part0 = part0;
	motor.Part1 = part1;
	motor.C0 = part0.CFrame.Inverse().mul(targetCFrame ? targetCFrame : part1.CFrame);
	motor.Parent = motor.Part0;
	return motor;
}
