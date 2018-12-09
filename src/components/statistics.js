import React, {Component} from 'react'
import { Statistic, Grid, Image, Icon, Header, 
				 Container, Divider, Button, Loader,
				 Dimmer, Segment} from 'semantic-ui-react'
import { connect } from "react-redux";

import {fetchCountStats} from '../actions/utilActions'


export class CountStats extends Component {
	componentWillMount() {
		this.props.dispatch(fetchCountStats())
	}

	render() {
		if (this.props.fetchedCountStats) {
			var statsGroup = (
			  <div style={{height:'60px'}}>
			    <Statistic.Group size='tiny'  widths='five'>
			      <Statistic>
			        <Statistic.Value>{this.props.countStats.num_photos}</Statistic.Value>
			        <Statistic.Label><Icon name='image'/>Photos</Statistic.Label>
			      </Statistic>
			      <Statistic>
			        <Statistic.Value>{this.props.countStats.num_people}</Statistic.Value>
			        <Statistic.Label><Icon name='users'/>People</Statistic.Label>
			      </Statistic>
			      <Statistic>
			        <Statistic.Value>{this.props.countStats.num_faces}</Statistic.Value>
			        <Statistic.Label><Icon name='user circle outline'/>Faces</Statistic.Label>
			      </Statistic>
			      <Statistic>
			        <Statistic.Value>{this.props.countStats.num_albumauto}</Statistic.Value>
			        <Statistic.Label><Icon name='wizard'/>Events</Statistic.Label>
			      </Statistic>
			      <Statistic>
			        <Statistic.Value>{this.props.countStats.num_albumdate}</Statistic.Value>
			        <Statistic.Label><Icon name='calendar'/>Days</Statistic.Label>
			      </Statistic>
			    </Statistic.Group>
			  </div>
			)
		}
		else {
			var statsGroup = (
			  <div style={{height:'60px'}}>
			    <Statistic.Group size='tiny'  widths='five'>
			      <Statistic>
			        <Statistic.Value>-</Statistic.Value>
			        <Statistic.Label><Icon name='image'/>Photos</Statistic.Label>
			      </Statistic>
			      <Statistic>
			        <Statistic.Value>-</Statistic.Value>
			        <Statistic.Label><Icon name='users'/>People</Statistic.Label>
			      </Statistic>
			      <Statistic>
			        <Statistic.Value>-</Statistic.Value>
			        <Statistic.Label><Icon name='user circle outline'/>Faces</Statistic.Label>
			      </Statistic>
			      <Statistic>
			        <Statistic.Value>-</Statistic.Value>
			        <Statistic.Label><Icon name='wizard'/>Events</Statistic.Label>
			      </Statistic>
			      <Statistic>
			        <Statistic.Value>-</Statistic.Value>
			        <Statistic.Label><Icon name='calendar'/>Days</Statistic.Label>
			      </Statistic>
			    </Statistic.Group>
			  </div>
			)		}
		console.log('rendering')
		return (
                <div>
			{statsGroup}
            </div>
		)
	}
}

CountStats = connect((store)=>{
  return {
    countStats: store.util.countStats,
    fetchingCountStats: store.util.fetchingCountStats,
    fetchedCountStats: store.util.fetchedCountStats,
  }
})(CountStats)
