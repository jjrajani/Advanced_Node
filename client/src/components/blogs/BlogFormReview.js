// BlogFormReview shows users their form inputs for review
import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import formFields from './formFields';
import { withRouter } from 'react-router-dom';
import * as actions from '../../actions';
import update from 'immutability-helper';

class BlogFormReview extends Component {
  state = { file: null };
  renderFields() {
    const { formValues } = this.props;

    return _.map(formFields, ({ name, label }) => {
      return (
        <div key={name}>
          <label>{label}</label>
          <div>{formValues[name]}</div>
        </div>
      );
    });
  }

  renderButtons() {
    const { onCancel } = this.props;

    return (
      <div>
        <button
          className="yellow darken-3 white-text btn-flat"
          onClick={onCancel}
        >
          Back
        </button>
        <button className="green btn-flat right white-text">
          Save Blog
          <i className="material-icons right">email</i>
        </button>
      </div>
    );
  }

  onSubmit(event) {
    event.preventDefault();

    const { submitBlog, history, formValues } = this.props;
    const { file } = this.state;

    submitBlog(formValues, file, history);
  }

  onFileClick = e => {
    e.preventDefault();
    this._input.click();
  }

  onFileChange = e => {
    this.setState(update(this.state, {
      file: { $set: e.target.files[0] }
    }));
  }

  renderFileSelect = () => {
    const { file } = this.state;

    return (
      <div>
        <h5>Add An Image</h5>
        <button
          className="yellow darken-3 white-text btn-flat"
          onClick={this.onFileClick}
        >
          Choose File
        </button>
        <input onChange={this.onFileChange} ref={c => this._input = c} style={{visibility: "hidden"}} type="file" accept="image/*" />
        <p>{file && file.name}</p>
      </div>
    )
  }

  render() {
    return (
      <form onSubmit={this.onSubmit.bind(this)}>
        <h5>Please confirm your entries</h5>
        {this.renderFields()}
        {this.renderFileSelect()}
        {this.renderButtons()}
      </form>
    );
  }
}

function mapStateToProps(state) {
  return { formValues: state.form.blogForm.values };
}

export default connect(mapStateToProps, actions)(withRouter(BlogFormReview));
