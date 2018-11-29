import React from 'react';



class NewRecordForm extends React.Component {
    constructor(props) {
      super(props);

      this.state = {};
  
      this.handleInputChange = this.handleInputChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
    
        this.setState({
          [name]: value
        });
      }
    
  
    handleSubmit(event) {
      alert('A name was submitted: ' + this.state.toString());
      event.preventDefault();
    }
  
    render() {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            First Name
          </label>
          <input
                value={this.state.firstName}
                onChange={this.handleInputChange}
            />

         
          <input type="submit" value="Submit" />
        </form>
      );
    }
  }

  export default NewRecordForm;