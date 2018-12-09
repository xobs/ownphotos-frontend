import React, { Component } from "react";
import {
  Form,
  Radio,
  Label,
  Step,
  Progress,
  List,
  Grid,
  Image,
  Icon,
  Item,
  Header,
  Segment,
  Accordion,
  Container,
  Message,
  Input,
  Button,
  Loader,
  Table,
  Dropdown,
  Popup,
  Divider,
  Pagination
} from "semantic-ui-react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import Modal from "react-modal";
import moment from "moment";

import {
  fetchCountStats,
  fetchPhotoScanStatus,
  fetchWordCloud,
  generateEventAlbums,
  fetchAutoAlbumProcessingStatus,
  generateEventAlbumTitles,
  fetchWorkerAvailability,
  setSiteSettings,
  fetchSiteSettings,
  updateUser,
  fetchNextcloudDirectoryTree,
  fetchJobList,
  fetchUserList,
  fetchDirectoryTree,
  manageUpdateUser
} from "../actions/utilActions";
import {
  trainFaces
} from "../actions/facesActions";
import {
  scanPhotos,
  scanNextcloudPhotos,
  fetchPhotos
} from "../actions/photosActions";
import { fetchUserSelfDetails } from "../actions/userActions";
import CountryPiChart from "../components/charts/countryPiChart";
import { CountStats } from "../components/statistics";
import WordCloud from "../components/charts/wordCloud";

import { AllPhotosMap, EventMap, LocationClusterMap } from "../components/maps";
import EventCountMonthGraph from "../components/eventCountMonthGraph";
import FaceClusterScatter from "../components/faceClusterGraph";
import SocialGraph from "../components/socialGraph";
import LazyLoad from "react-lazyload";
import { LocationLink } from "../components/locationLink";

import Dropzone from "react-dropzone";
import AvatarEditor from "react-avatar-editor";
import MaterialIcon, { colorPallet } from "material-icons-react";
import SortableTree from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";

export class AdminPage extends Component {
  state = { modalOpen: false, userToEdit: null };

  componentDidMount() {
    if (this.props.auth.access.is_admin) {
      this.props.dispatch(fetchSiteSettings());
      this.props.dispatch(fetchJobList());
      this.props.dispatch(fetchUserList());
      this.props.dispatch(fetchDirectoryTree());
    }
  }

  render() {
    if (!this.props.auth.access.is_admin) {
      return <div>Unauthorized</div>;
    }

    if (this.props.userSelfDetails.square_avatar) {
      var avatarImgSrc = this.props.userSelfDetails.square_avatar;
    } else if (this.state.avatarImgSrc) {
      var avatarImgSrc = this.state.avatarImgSrc;
    } else {
      var avatarImgSrc = "/unknown_user.jpg";
    }

    var buttonsDisabled = !this.props.workerAvailability;

    return (
      <div style={{ padding: 10 }}>
        <Header as="h2">
          <Icon name="wrench" />
          <Header.Content>Admin Area</Header.Content>
        </Header>

        <Divider />
        <Header as="h3">Site settings</Header>

        <Grid>
          <Grid.Row>
            <Grid.Column width={4} textAlign="left">
              <b>Allow user registration</b>
            </Grid.Column>

            <Grid.Column width={12}>
              <Form>
                <Form.Group>
                  <Form.Field>
                    <Radio
                      label="Allow"
                      name="radioGroup"
                      onChange={() =>
                        this.props.dispatch(
                          setSiteSettings({ allow_registration: true })
                        )
                      }
                      checked={this.props.siteSettings.allow_registration}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Radio
                      label="Do not allow"
                      name="radioGroup"
                      onChange={() =>
                        this.props.dispatch(
                          setSiteSettings({ allow_registration: false })
                        )
                      }
                      checked={!this.props.siteSettings.allow_registration}
                    />
                  </Form.Field>
                </Form.Group>
              </Form>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Divider />
        <Header as="h3">
          Users<Loader
            size="mini"
            active={this.props.fetchingUserList}
            inline
          />
        </Header>

        <Table compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Username</Table.HeaderCell>
              <Table.HeaderCell>Scan Directory</Table.HeaderCell>
              <Table.HeaderCell>Photo Count</Table.HeaderCell>
              <Table.HeaderCell>Last Login</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.props.userList.map(user => {
              return (
                <Table.Row>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell error={!user.scan_directory}>
                    <Icon
                      name="edit"
                      onClick={() => {
                        this.setState({
                          userToEdit: user,
                          modalOpen: true
                        });
                      }}
                    />
                    {user.scan_directory ? user.scan_directory : "Not set"}
                  </Table.Cell>
                  <Table.Cell>{user.photo_count}</Table.Cell>
                  <Table.Cell>{moment(user.date_joined).fromNow()}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        <Divider />
        <Header as="h3">
          Worker Logs{" "}
          <Loader size="mini" active={this.props.fetchingJobList} inline />
        </Header>
        <JobList />

        <ModalScanDirectoryEdit
          onRequestClose={() => {
            this.setState({ modalOpen: false });
          }}
          userToEdit={this.state.userToEdit}
          isOpen={this.state.modalOpen}
        />
      </div>
    );
  }
}

const modalStyles = {
  content: {
    top: 150,
    left: 40,
    right: 40,
    height: window.innerHeight - 300,

    overflow: "hidden",
    // paddingRight:0,
    // paddingBottomt:0,
    // paddingLeft:10,
    // paddingTop:10,
    padding: 0,
    backgroundColor: "white"
  },
  overlay: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: "fixed",
    borderRadius: 0,
    border: 0,
    zIndex: 102,
    backgroundColor: "rgba(200,200,200,0.8)"
  }
};

class JobList extends Component {
  state = { activePage: 1, pageSize: 10 };

  componentDidMount() {
    if (this.props.auth.access.is_admin) {
      this.props.dispatch(
        fetchJobList(this.state.activePage, this.state.pageSize)
      );
    }
  }

  render() {
    return (
      <div>
        <Table compact attached="top">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Job Type</Table.HeaderCell>
              <Table.HeaderCell>Time Started</Table.HeaderCell>
              <Table.HeaderCell>Time Finished</Table.HeaderCell>
              <Table.HeaderCell>Duration</Table.HeaderCell>
              <Table.HeaderCell>Started By</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.props.jobList.map(job => {
              return (
                <Table.Row
                  key={job.job_id}
                  error={job.failed}
                  warning={!job.finished_at}
                >
                  <Table.Cell>
                    {job.finished ? (
                      job.failed ? (
                        <Icon name="warning sign" color="red" />
                      ) : (
                        <Icon name="checkmark" color="green" />
                      )
                    ) : (
                      <Icon name="refresh" loading color="yellow" />
                    )}
                  </Table.Cell>
                  <Table.Cell>{job.job_type_str}</Table.Cell>
                  <Table.Cell>
                    {moment(job.started_at).format("YYYY-MM-DD") +
                      " (" +
                      moment(job.started_at).fromNow() +
                      ")"}
                  </Table.Cell>
                  <Table.Cell>
                    {job.finished_at
                      ? moment(job.finished_at).format("YYYY-MM-DD") +
                        " (" +
                        moment(job.finished_at).fromNow() +
                        ")"
                      : "still running..."}
                  </Table.Cell>
                  <Table.Cell>
                    {job.finished
                      ? moment
                          .duration(
                            moment(job.finished_at) - moment(job.started_at)
                          )
                          .humanize()
                      : "still running..."}
                  </Table.Cell>
                  <Table.Cell>{job.started_by.username}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        <Pagination
          attached="bottom"
          defaultActivePage={this.state.page}
          ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
          firstItem={{ content: <Icon name='angle double left' />, icon: true }}
          lastItem={{ content: <Icon name='angle double right' />, icon: true }}
          prevItem={{ content: <Icon name='angle left' />, icon: true }}
          nextItem={{ content: <Icon name='angle right' />, icon: true }}
          totalPages={Math.ceil(this.props.jobCount.toFixed(1) / this.state.pageSize)}
          onPageChange={(e,d)=>{
            console.log(d.activePage)
            this.setState({activePage:d.activePage})
            this.props.dispatch(fetchJobList(d.activePage,this.state.pageSize))
          }}
        />

      </div>
    );
  }
}

class ModalScanDirectoryEdit extends Component {
  constructor(props) {
    super(props);
    this.state = { newScanDirectory: "", treeData: [] };
    this.nodeClicked = this.nodeClicked.bind(this);
    this.inputRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.treeData.length === 0) {
      return { ...prevState, treeData: nextProps.directoryTree };
    } else {
      return prevState;
    }
  }

  nodeClicked(event, rowInfo) {
    console.log(rowInfo);
    this.inputRef.current.inputRef.value = rowInfo.node.absolute_path;
    this.setState({ newScanDirectory: rowInfo.node.absolute_path });
  }

  render() {
    console.log(this.inputRef);
    return (
      <Modal
        ariaHideApp={false}
        isOpen={this.props.isOpen}
        onRequestClose={() => {
          this.props.onRequestClose();
          this.setState({ newScanDirectory: "" });
        }}
        style={modalStyles}
      >
        <div style={{ padding: 10 }}>
          <Header as="h3">
            Set the scan directory for user "{this.props.userToEdit
              ? this.props.userToEdit.username
              : "..."}"
            <Header.Subheader>
              When the user "{this.props.userToEdit
                ? this.props.userToEdit.username
                : "..."}" clicks on the 'scan photos' button, photos in the
              directory that you specify here will be imported under the user's
              account.
            </Header.Subheader>
          </Header>
        </div>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <div style={{ padding: 10 }}>
                <Header as="h5">User's current directory</Header>
              </div>
              <div style={{ padding: 7 }}>
                <Input
                  ref={this.inputRef}
                  type="text"
                  placeholder={
                    this.props.userToEdit
                      ? this.props.userToEdit.scan_directory === ""
                        ? "not set"
                        : this.props.userToEdit.scan_directory
                      : "..."
                  }
                  action
                  fluid
                >
                  <input />
                  <Button
                    type="submit"
                    color="green"
                    onClick={() => {
                      const newUserData = {
                        ...this.props.userToEdit,
                        scan_directory: this.state.newScanDirectory
                      };
                      console.log(newUserData);
                      this.props.dispatch(manageUpdateUser(newUserData));
                      this.props.onRequestClose();
                    }}
                  >
                    Update
                  </Button>
                </Input>
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <div style={{ padding: 10 }}>
                <Header as="h5">Choose a directory from below</Header>
              </div>
              <div
                style={{
                  height: 300,
                  width: "100%",
                  paddingLeft: 7,
                  paddingTop: 7,
                  paddingBottom: 7
                }}
              >
                <SortableTree
                  innerStyle={{ outline: "none" }}
                  canDrag={() => false}
                  canDrop={() => false}
                  treeData={this.state.treeData}
                  onChange={treeData => this.setState({ treeData })}
                  theme={FileExplorerTheme}
                  generateNodeProps={rowInfo => {
                    let nodeProps = {
                      onClick: event => this.nodeClicked(event, rowInfo)
                    };
                    if (this.state.selectedNodeId === rowInfo.node.id) {
                      nodeProps.className = "selected-node";
                    }
                    return nodeProps;
                  }}
                />
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal>
    );
  }
}

JobList = connect(store => {
  return {
    auth: store.auth,
    jobList: store.util.jobList,
    jobCount: store.util.jobCount,
    fetchingJobList: store.util.fetchingJobList,
    fetchedJobList: store.util.fetchedJobList
  };
})(JobList);

ModalScanDirectoryEdit = connect(store => {
  return {
    auth: store.auth,

    directoryTree: store.util.directoryTree,
    fetchingDirectoryTree: store.util.fetchingDirectoryTree,
    fetchedDirectoryTree: store.util.fetchedDirectoryTree,

    userList: store.util.userList,
    fetchingUSerList: store.util.fetchingUserList,
    fetchedUserList: store.util.fetchedUserList
  };
})(ModalScanDirectoryEdit);

AdminPage = connect(store => {
  return {
    auth: store.auth,
    util: store.util,
    gridType: store.ui.gridType,
    siteSettings: store.util.siteSettings,
    statusPhotoScan: store.util.statusPhotoScan,
    statusAutoAlbumProcessing: store.util.statusAutoAlbumProcessing,
    generatingAutoAlbums: store.util.generatingAutoAlbums,
    scanningPhotos: store.photos.scanningPhotos,
    fetchedCountStats: store.util.fetchedCountStats,
    workerAvailability: store.util.workerAvailability,
    fetchedNextcloudDirectoryTree: store.util.fetchedNextcloudDirectoryTree,
    userSelfDetails: store.user.userSelfDetails,
    fetchingJobList: store.util.fetchingJobList,
    fetchedJobList: store.util.fetchedJobList,
    userList: store.util.userList,
    fetchingUserList: store.util.fetchingUserList,
    fetchedUserList: store.util.fetchedUserList
  };
})(AdminPage);
