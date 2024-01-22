import React from "react";

import styles from "./column.module.css";
import { mergeClasses } from "../../../../utils/styles";

type ColumnProps = {
    children?: React.ReactNode;
    className?: string;
    ref?: (el: HTMLElement | null) => void;
};

function Column(props: ColumnProps) {
    const { children, className, ref } = props;

    return (
        <div ref={ref} className={mergeClasses(styles.root, className)}>
            {children}
        </div>
    );
}

export default Column;
