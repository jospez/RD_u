import { SET_TOKEN_VAULT_TABLE_CONTEXT } from '../actionTypes'

/**
 * @typedef {"FXDOCU" | "FD"} TokenVaultTableContext 
 */

/**
 * @param {TokenVaultTableContext} context 
 * @returns 
 */
export function tokenVaultTableContext(context) {
    return (dispatch) => dispatch({
        type: SET_TOKEN_VAULT_TABLE_CONTEXT,
        payload: context
    })
}