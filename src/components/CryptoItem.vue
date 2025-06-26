<template>
  <div class="crypto-item">
    <div class="radio-button">
      <input type="radio" :checked="isSelected" :id="crypto.id" :name="radioGroupName" />
      <span class="custom-radio"></span>
    </div>
    <img :src="crypto.icon" :alt="crypto.name" class="crypto-icon" />
    <div class="crypto-info">
      <div class="crypto-name">
        {{ crypto.ticker }} <span class="full-name">{{ crypto.name }}</span>
      </div>
      <div class="crypto-balance">{{ formatBalance(crypto.combinedBalance) }} USDT</div>
    </div>
    <div class="crypto-source">
      <span v-for="chain in crypto.sourceChains" :key="chain" class="chain-tag">
        {{ chain }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Crypto } from '../types/index.d.ts'

interface Props {
  crypto: Crypto
  isSelected: boolean
  radioGroupName: string
}

// Simply call defineProps without assigning to a 'props' variable
// The props (crypto, isSelected, radioGroupName) are still available directly in the template.
defineProps<Props>()

const formatBalance = (balance: number) => {
  return new Intl.NumberFormat('en-US').format(balance)
}
</script>

<style scoped>
.crypto-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #2a2a2a;
  border-bottom: 1px solid #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
  gap: 12px;
}

.crypto-item:hover {
  background-color: #3a3a3a;
}

.crypto-item:last-child {
  border-bottom: none;
}

.radio-button {
  position: relative;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.radio-button input[type='radio'] {
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
}

.custom-radio {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid #555;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: transparent;
  transition: all 0.2s ease;
}

.radio-button input[type='radio']:checked + .custom-radio {
  border-color: #4caf50;
  background-color: #4caf50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.3);
}

.radio-button input[type='radio']:checked + .custom-radio::after {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.crypto-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.crypto-info {
  flex-grow: 1;
}

.crypto-name {
  font-weight: 600;
  color: #fff;
  font-size: 1.1em;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.crypto-name .full-name {
  font-weight: 400;
  color: #aaa;
  font-size: 0.9em;
}

.crypto-balance {
  font-size: 0.9em;
  color: #888;
  margin-top: 2px;
}

.crypto-source {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.chain-tag {
  background-color: #444;
  color: #eee;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  white-space: nowrap;
}
</style>
