import React, { ReactNode, SFC } from "react";
import { Button, Inputt } from "antd";

export interface IProps {
    title: string | ReactNode;
    description: string | ReactNode;
}
const StepComplete: SFC<IProps> = ({ title, description, children }) => {
    return (
        <div>
            <Button></Button>
            <Inputt></Inputt>
        </div>
    );
};
export default StepComplete;
