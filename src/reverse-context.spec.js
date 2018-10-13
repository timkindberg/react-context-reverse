import React from "react";
import { fireEvent, render } from "react-testing-library";
import { createReverseContext } from "./reverse-context";

describe("createReverseContext", () => {
  it("sends props from child to ancestor on mount and update", () => {
    /* We are going to share the Child's className with the Parent */
    const ClassNameContext = createReverseContext(false);

    const Parent = props => (
      <ClassNameContext.ReverseConsumer>
        {className => <div {...props} className={`Parent ${className}`} />}
      </ClassNameContext.ReverseConsumer>
    );

    const Child = props => (
      <ClassNameContext.ReverseProvider value={props.className}>
        <div className={`Child ${props.className}`} />
      </ClassNameContext.ReverseProvider>
    );

    /* Example adds the Child inside the Parent,
       as well as a button to change the className */
    class Example extends React.Component {
      state = { num: 1 };
      render() {
        return (
          <div>
            <Parent>
              <Child className={`Child-${this.state.num}`} />
            </Parent>
            <button onClick={() => this.setState({ num: this.state.num + 1 })}>
              Increase Num
            </button>
          </div>
        );
      }
    }

    const { container, getByText } = render(<Example />);

    /* We see the className is shared to the Parent */
    expect(container.querySelector(".Parent")).toMatchInlineSnapshot(`
<div
  class="Parent Child-1"
>
  <div
    class="Child Child-1"
  />
</div>
`);

    fireEvent.click(getByText("Increase Num"));

    /* We see the className shared to Parent has updated */
    expect(container.querySelector(".Parent")).toMatchInlineSnapshot(`
<div
  class="Parent Child-2"
>
  <div
    class="Child Child-2"
  />
</div>
`);
  });
});
