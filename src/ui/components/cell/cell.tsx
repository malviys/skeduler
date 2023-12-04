import classes from "./cell.module.scss";

export type CellProps = {
    id: string;
};

function Cell(props: CellProps) {
    const { id } = props;

    return <div id={id} className={classes["container"]} />;
}

export default Cell;
