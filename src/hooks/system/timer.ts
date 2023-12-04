import { useEffect, useState } from "react";

export function useTimer() {
	const [time, setTime] = useState<Date>(new Date());

	useEffect(() => {
		const iId = setInterval(() => {
			const now = new Date();

			if (now.getSeconds() === 0) {
				setTime(now);
			}
		}, 1000);

		return () => {
			clearInterval(iId);
		};
	}, []);

	return time;
}
