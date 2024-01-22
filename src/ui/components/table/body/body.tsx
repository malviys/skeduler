import React from "react";

import styles from "./body.module.css";

type BodyProps = {
    children?: React.ReactNode;
};

function Body(props: BodyProps) {
    const { children } = props;

    return <div className={styles.root}>{children}</div>;
}

export default Body;
