import * as ui from "cutter-ui";
import lodash22 from "loadsh";
import { Button, Input, List } from "antd";
import { Extend, cloneDeep as Clone } from "lodash";

const ButtonExample = () => {
    return (
        <div>
            <ButtonTest1></ButtonTest1>

            <Radio></Radio>
            <CC></CC>
            <Popver>test1</Popver>
            <h1 className='guide'>功能展示</h1>
            <Btn type='primary'>Primary</Btn>
            <Btn type='primary' loading></Btn>
            <Button> test1 </Button>
            <Button> test2 </Button>
            <Button> test3 </Button>
            <Input value='input' />
            <Extend>test2</Extend>
            <Clone>test</Clone>
            <List>
                <Input value='input' />
                <Input value='input' />
                <Input value='input' />
            </List>
        </div>
    );
};

ReactDOM.render(<ButtonExample />, mountNode);
