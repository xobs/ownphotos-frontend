import React, { Component } from "react";
import { Header } from "semantic-ui-react";
import { fetchUserPublicPhotos } from "../actions/publicActions";
import { connect } from "react-redux";
import { PhotoListView } from "./ReusablePhotoListView";
import _ from "lodash";
import moment from "moment";
import {
  TopMenu,
  SideMenuNarrow,
  TopMenuPublic,
  SideMenuNarrowPublic
} from "./menubars";

var TOP_MENU_HEIGHT = 45; // don't change this
var LEFT_MENU_WIDTH = 85; // don't change this

export class UserPublicPage extends Component {
  state = {
    photosGroupedByDate: [],
    idx2hash: [],
    username: null
  };

  componentDidMount() {
    this.props.dispatch(
      fetchUserPublicPhotos(this.props.match.params.username)
    );
    // this.props.dispatch({ type: "HIDE_SIDEBAR" });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.pub.userPublicPhotos.hasOwnProperty(
        nextProps.match.params.username
      )
    ) {
      const photos =
        nextProps.pub.userPublicPhotos[nextProps.match.params.username];
      if (prevState.idx2hash.length != photos.length) {
        var t0 = performance.now();
        var groupedByDate = _.groupBy(photos, el => {
          if (el.exif_timestamp) {
            return moment(el.exif_timestamp).format("YYYY-MM-DD");
          } else {
            return "No Timestamp";
          }
        });
        var groupedByDateList = _.reverse(
          _.sortBy(
            _.toPairsIn(groupedByDate).map(el => {
              return { date: el[0], photos: el[1] };
            }),
            el => el.date
          )
        );
        var idx2hash = [];
        groupedByDateList.forEach(g => {
          g.photos.forEach(p => {
            idx2hash.push(p.image_hash);
          });
        });
        var t1 = performance.now();
        return {
          ...prevState,
          photosGroupedByDate: groupedByDateList,
          idx2hash: idx2hash,
          username: nextProps.match.params.username
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  render() {
    const { fetchingAlbumsUser } = this.props;
    if (this.props.auth.access) {
      var menu = (
        <div>
          {this.props.ui.showSidebar && <SideMenuNarrow />}
          <TopMenu />
        </div>
      );
    } else {
      var menu = (
        <div>
          {this.props.ui.showSidebar && <SideMenuNarrowPublic />}
          <TopMenuPublic />
        </div>
      );
    }
    return (
      <div>
        {menu}
        <div
          style={{
            paddingTop: TOP_MENU_HEIGHT,
            paddingLeft: this.props.ui.showSidebar ? LEFT_MENU_WIDTH + 5 : 5
          }}
        >
          <PhotoListView
            title={
              this.props.auth.access &&
              this.props.auth.access.name === this.props.match.params.username
                ? "Your public photos"
                : "Public photos of " + this.props.match.params.username
            }
            loading={this.props.pub.fetchingUserPublicPhotos}
            titleIconName={"globe"}
            photosGroupedByDate={this.state.photosGroupedByDate}
            idx2hash={this.state.idx2hash}
            isPublic={
              this.props.auth.access === undefined ||
              this.props.auth.access.name !== this.props.match.params.username
            }
          />
        </div>
      </div>
    );
  }
}
UserPublicPage = connect(store => {
  return {
    pub: store.pub,
    ui: store.ui,
    auth: store.auth
  };
})(UserPublicPage);
