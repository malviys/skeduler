import React from "react";

import styles from "./container.module.css";

type ContainerProps = {
    children?: React.ReactNode;
};

function Container(props: ContainerProps) {
    const { children } = props;

    return <div className={styles.root}>{children}</div>;
}

export default Container;
