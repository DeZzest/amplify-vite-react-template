export const getTime = (time: string) => {
	const newTime = time.split('');
	const indexT = newTime.indexOf('T');
	const indexDot = newTime.indexOf('.', indexT);
	return newTime.join('').slice(indexT + 1, indexDot - 3);
};
