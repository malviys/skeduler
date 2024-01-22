import React from "react";

/** View */
type View = {
    /** */
    init?: () => { headers: { id: string; title: string }[]; grid: [][] };

    /** */
    renderView: () => React.ReactNode;
};

export default View;
