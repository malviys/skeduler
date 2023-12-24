import React from "react";

import classes from "./loader.module.scss";

type TLoaderProps = {
    show?: boolean;
    children?: JSX.Element;
};

function Loader(props: TLoaderProps) {
    const { children = <>Loading...</>, show } = props;

    if (!show) {
        return <></>;
    }

    return <div className={classes.container}>{children}</div>;
}

export default React.memo(Loader);
