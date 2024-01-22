import React from "react";

import styles from "./row.module.css"

type RowProps = {
    children?: React.ReactNode;
};

function Row(props: RowProps) {
    const { children } = props;

    return <div className={styles.root}>{children}</div>;
}

export default Row;
