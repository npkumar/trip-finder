<template>
  <div class="container">
    <h1><i class="el-icon-position" /> {{ title }}</h1>

    <div class="container-form">
        <el-select v-model="departure" placeholder="Departure">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-select v-model="arrival" placeholder="Arrival">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-button 
          type="primary"
          @click.prevent="onSubmit()"
          :disabled="isValidQuery" 
          :loading="isLoading" 
          icon="el-icon-search">
        </el-button>
    </div>

    <div class="container-form-granularity">
      <el-radio v-model="granularity" label="time">Fastest</el-radio>
      <el-radio v-model="granularity" label="money">Cheapest</el-radio>
    </div>

    <div>
      <el-card shadow="never" v-if="selectedItenary.length > 0">
        <div class="result-summary">
          <span><i class="el-icon-timer" /> {{ getTotalTime }}</span>
          <span><i class="el-icon-money" /> {{ getTotalCost }}</span>
        </div>
      </el-card>
    </div>
    <div class="result-container">
        <el-card shadow="always" v-for="item in selectedItenary" :key="item.reference">
          <div class="result-container-wrapper">
            <div class="result-container-section-one"></div>
            <div class="result-container-section-two">
              <el-steps direction="vertical" :active="1">
                <el-step icon="el-icon-position" :title="item.departure"></el-step>
                <el-step icon="el-icon-location-outline" :title="item.arrival" :description="`${item.duration.h}h${item.duration.m}m`"></el-step>
              </el-steps>
            </div>
            <div class="result-container-section-three">
              <div class="result-container-section-three__type">{{ item.transport.toUpperCase() }} {{ item.reference }}</div>
              <div class="result-container-section-three__cost">{{ totalCost(item.cost, item.discount) }} {{ getCurrency() }}</div>
            </div>
          </div>
        </el-card>
    </div>
  </div>
</template>

<script>
import { totalDuration, totalCost } from '../services/util';
import {getShortestPath, getCurrency, getLocations} from '../services/shortestPath';

export default {
  name: 'Main',
  props: {
    title: String
  },
  data() {
    return {
      options: getLocations().sort().map(item => ({ value: item, label: item})),
      departure: '',
      arrival: '',
      granularity: 'time',
      isLoading: false,
      selectedItenary: []
    }
  },
  computed: {
    /**
     * Disable search if arrival and departure are the same or they are undefined.
     */
    isValidQuery() {
      if (this.arrival && this.departure && this.arrival !== this.departure) {
        return false;
      }
      return true;
    },

    /**
     * Return formatted total time for trip.
     */
    getTotalTime() {
      if (this.selectedItenary.length > 0) {
        const total = _.sum(this.selectedItenary.map(item => totalDuration(item.duration)));
        return `${Math.floor(total / 60)}h${Math.floor(total % 60)}m`;
      }
      return '00m';
    },

    /**
     * Return formatted total cost for trip.
     */
    getTotalCost() {
      if (this.selectedItenary.length > 0) {
        const total = _.sum(this.selectedItenary.map(item => totalCost(item.cost, item.discount)));
        return `${total} ${getCurrency()}`;
      }
      return `0 ${getCurrency()}`;
    }
  },
  methods: {
    getCurrency: getCurrency,
    totalCost: totalCost,
    onSubmit() {
      this.isLoading = true;
      this.selectedItenary = getShortestPath(this.departure, this.arrival, this.granularity);
      this.isLoading = false;
    }
  }
}
</script>

<style scoped>
  h1 {
    text-align: center;
  }

  .el-card {
    margin-top: 1em;
  }

  .el-select-dropdown__item {
    font: inherit;
  }

  .container {
    width: 75%; 
    max-width: 600px; 
    margin: 0 auto;
  }

  .container-form {
    display: flex; 
    justify-content: space-around; 
    align-items: center;
  }

  .container-form-granularity {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 1em;
  }

  .result-summary {
    display: flex;
    justify-content: space-around;
  }

  .result-container {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: stretch;
  }

  .result-container-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .result-container-section-one {
    flex-grow: 1;
  }
  
  .result-container-section-two {
    flex-grow: 2;
    height: 100px;
    text-align: center;
  }

  .result-container-section-three {
    flex-grow: 1;
    max-width: 150px;
  }

  .result-container-section-three__type {
    font-size: 0.8em;
  }

  .result-container-section-three__cost {
    color: #F56C6C;
  }
  
  @media screen and (max-width: 600px) {
    .container {
      width: 90%;
    }
  }
</style>

