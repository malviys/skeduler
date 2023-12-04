import { useEffect, useState } from "react";

export function useWindowFocus() {
	const [focused, setFocued] = useState(false);

	useEffect(() => {
		function windowFocusListener(event: FocusEvent) {
			setFocued(true);
		}

		function windowBlurListener(event: FocusEvent) {
			setFocued(false);
		}

		window.addEventListener("focus", windowFocusListener);
		window.addEventListener("blur", windowBlurListener);

		return () => {
			window.removeEventListener("focus", windowFocusListener);
			window.removeEventListener("blur", windowBlurListener);
		};
	}, []);

	return focused;
}
