<template>
  <div class="currency-input-container">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="input-group">
      <input
        type="number"
        :value="modelValue"
        @input="handleInput"
        :placeholder="placeholder"
        class="amount-input"
        step="any"
        min="0"
      />
      <div class="currency-selector">
        <select :value="selectedCurrency" @change="handleCurrencyChange" class="currency-select">
          <option v-for="currency in availableCurrencies" :key="currency" :value="currency">
            {{ currency }}
          </option>
        </select>
        <span class="select-arrow"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Props {
  modelValue: number | null
  selectedCurrency: string
  availableCurrencies: string[]
  label?: string
  placeholder?: string
}

defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'update:selectedCurrency'])

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  // Ensure the value is a number or null
  const numericValue = value === '' ? null : parseFloat(value)
  emit('update:modelValue', numericValue)
}

const handleCurrencyChange = (event: Event) => {
  emit('update:selectedCurrency', (event.target as HTMLSelectElement).value)
}
</script>

<style scoped>
.currency-input-container {
  margin-bottom: 15px;
}

.input-label {
  display: block;
  font-size: 0.9em;
  color: #ccc;
  margin-bottom: 5px;
}

.input-group {
  display: flex;
  background-color: #333;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #444;
}

.amount-input {
  flex-grow: 1;
  padding: 10px 15px;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 1.1em;
  outline: none;
  appearance: textfield;
}

/* Hide arrow for Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}

/* Hide arrow for Chrome, Safari, Edge */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input::placeholder {
  color: #888;
}

.currency-selector {
  position: relative;
  background-color: #444;
  border-left: 1px solid #555;
  padding: 0 10px;
  display: flex;
  align-items: center;
}

.currency-select {
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 1em;
  padding-right: 25px;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
}

.currency-select option {
  background-color: #333;
  color: #fff;
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #bbb;
  pointer-events: none;
}
</style>
