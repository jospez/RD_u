import { SET_TOKEN_VAULT_TABLE_CONTEXT } from '../actionTypes';

/**
 * @typedef {import('../actions/tokenVaultTableContext.js').TokenVaultTableContext} TokenVaultTableContext
 */

/**
 * @type {{
 *      context: TokenVaultTableContext
 * }}
 */
const initialState = {
    context: "FXDOCU"
}

export default function tokenVaultTableContext(state = initialState, action) {
    switch (action.type) {
        case SET_TOKEN_VAULT_TABLE_CONTEXT:
            return {
                ...state,
                context: action.payload
            }
        default:
            return {
                ...state,
            };
    }
}