/**
 * Divide value by 10^18
 * @param {number} value 
 * @returns {number}
 */
 export const applyPowerDivision = (value) => +value;
// implementation patch until CSAG removes divison on their side
// export const applyPowerDivision = (value, power = 18) => +value / Math.pow(10, power);

 /**
 * Multiply value by 10^18
 * @param {number} value 
 * @returns {number}
 */
  export const applyPowerMultiplication = (value) => +value;
// implementation patch until CSAG removes multiplication on their side
// export const applyPowerMultiplication = (value, power = 18) => +value * Math.pow(10, power);