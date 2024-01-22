import React from "react";

import { mergeClasses } from "../../../../utils/styles";

import styles from "./cell.module.css";

type CellProps = {
    children?: React.ReactNode;
    className?: string;
};

function Cell(props: CellProps) {
    const { children, className } = props;
    
    return <div className={mergeClasses(styles.root, className)}>{children}</div>;
}

export default Cell;
