import React from "react";

import styles from "./header.module.css";

type HeaderProps = {
    children?: React.ReactNode;
};

function Header(props: HeaderProps) {
    const { children } = props;

    return <div className={styles.root}>{children}</div>;
}

export default Header;
