import dayjs from "dayjs";

import { Body, Cell, Column, Header, Row, Table } from "../../components/table";
import View from "../view";

import styles from "./day.module.css";
import TimeIndicator from "../../components/time-indicator/time-indicator";
import Droppable from "../../components/droppable/droppable";

const DayView: View = {
    init: () => {
        const headers = [{ id: "1", title: dayjs().format("dddd") }];

        const grid: [][] = [];

        return {
            headers,
            grid,
        };
    },

    renderView: () => {
        return (
            <Table>
                <Header>
                    <Row>
                        <Column className={styles.column}>
                            <Cell />
                        </Column>
                        <Column>
                            <Cell>{dayjs().format("dddd")}</Cell>
                        </Column>
                    </Row>
                </Header>
                <Body>
                    <Row>
                        <Column className={styles.column}>
                            {Array.from({ length: 24 }, () => (
                                <Cell />
                            ))}
                        </Column>
                        <Droppable id="123">
                            {(ref) => (
                                <Column ref={ref}>
                                    {Array.from({ length: 24 }, () => (
                                        <Cell>1</Cell>
                                    ))}
                                </Column>
                            )}
                        </Droppable>
                    </Row>
                </Body>
            </Table>
        );
    },
};

export default DayView;
