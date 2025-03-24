"use strict";

/**
 * MODEL_FACTORY and INITIAL_STATE_BUILDER are global objects for managing structured state.
 * 
 * MODEL_FACTORY: Creates a model instance with predefined fields and provides methods 
 * for state manipulation, such as appending, removing, and clearing values.
 * 
 * INITIAL_STATE_BUILDER: Helps construct an initial state object by setting properties 
 * and ensuring the correct field structure before passing it to MODEL_FACTORY.
 */
(function (parentCodeDelimiter="_") {
	if (globalThis["MODEL_FACTORY"] && globalThis["INITIAL_STATE_BUILDER"]) return;
	
	const FIELD_TYPE = Object.freeze({ STRING: "string", ARRAY:"array" });
	const PARENT_CODE_DELIMITER =parentCodeDelimiter;
	const _fieldPrototype = {
		get value() {
			return (this.type === FIELD_TYPE.ARRAY) ? [...this._value]:this._value; 
		}, 
	};
	
	const _createField = (value) => {
		var o = Object.create(_fieldPrototype);
		var isArray = Array.isArray(value);
		o._value = isArray ? value.filter(e => e !== undefined && e !== null && e !== "") : value;
		o.type = isArray ? FIELD_TYPE.ARRAY : FIELD_TYPE.STRING;
		return o;
	};
	
	
	/**
     * Factory function to create a model with initial state.
     * @param {object} initialState - Initial state object.
     * @returns {object} - Model with state management methods.
     * @throws {Error} If initialState is invalid.
    */
	var MODEL_FACTORY = (initialState) => {
		//validate
		if (initialState === undefined || initialState === null || typeof initialState !== "object") throw new Error("initialState is required.");
		Object.values(initialState)
		.forEach(field => { 
			if (!_fieldPrototype.isPrototypeOf(field)) throw new Error("'fieldPrototype' should be used as the prototype.");
		});
		
		var _state = Object.assign({}, initialState);
		const _keys = Object.keys(initialState);
		const _validateFieldName = (fieldName) => {
			if (!_keys.includes(fieldName)) throw new Error(`${fieldName} is invalid fieldName.`);
		}
		
		// model methods
		return {
			get PARENT_CODE_DELIMITER () {
				return PARENT_CODE_DELIMITER;
			},
			get FIELD_TYPE() {
				return FIELD_TYPE;
			},
			
			/**
             * Appends a value to a field.
             * @param {string} fieldName - Field to modify.
             * @param {string} codeValue - Value to append.
			*/
			append( fieldName, codeValue) {
				_validateFieldName(fieldName);
				var field = _state[fieldName];
				switch(field.type) {
					case FIELD_TYPE.STRING:
					_state[fieldName] = _createField(codeValue); break;
					case FIELD_TYPE.ARRAY:
					if(_state[fieldName].value.includes(codeValue)) return;
					var split= codeValue.split(PARENT_CODE_DELIMITER);
					var [parentCode, childCode] = split;
					if (childCode) {
						_state[fieldName] = _createField([...(field.value.filter(e => e!==parentCode)),codeValue]);
					}else {
						_state[fieldName] = _createField([...(field.value.filter(e=>!e.startsWith(parentCode + PARENT_CODE_DELIMITER))), codeValue]);
					}
					break;
				}
			},

			/**
             * Clears the value of a field.
             * @param {string} fieldName - Field to clear.
			*/
			clearField(fieldName) {
				_validateFieldName(fieldName);
				var field = _state[fieldName];
				switch(field.type) {
					case FIELD_TYPE.STRING: this.append(fieldName, ""); break;
					case FIELD_TYPE.ARRAY: _state[fieldName] = _createField([]); break;
				}
			},

            /**
             * Removes a specific value from a field.
             * @param {string} fieldName - Field to modify.
             * @param {string} codeValue - Value to remove.
			*/
			remove(fieldName, codeValue) {
				_validateFieldName(fieldName);
				var field=_state[fieldName];
				switch(field.type) {
					case FIELD_TYPE.STRING: this.clearField(fieldName); break;
					case FIELD_TYPE.ARRAY: _state[fieldName] = _createField([...(field.value.filter(e=>e!==codeValue))]);break;
				}
			},
			
			/** Clears all fields in the model. */
			clearState() {_keys.forEach(key=>this.clearField(key));},
			
			/** @returns {object} Immutable state object. */
			get state() {
				return Object.freeze(Object.assign({}, _state));
			},

			/** @returns {string[]} List of field names. */
			get keys() { 
				return [..._keys];
			},

			/**
             * Creates a hidden form with current state values.
             * @returns {HTMLFormElement} Form element.
			*/
			createFormElement() {
				var form = document.createElement("form");
				var tempFormId = crypto.randomUUID();
				form.style.display="none";
				form.id=tempFormId;
				form.method="post";
				
				Object.entries(_state)
					.map(entry => {
						var input =document.createElement("input");
						input.type="hidden";
						input.name=`${entry[0]}`;
						input.value=`${entry[1].value}`;
						return input;
					})
					.forEach(input => form.appendChild(input));
				return form;
			},
		}
	};
		

    /**
     * Builder for initializing state objects.
     * @param {object} obj - Initial key-value pairs for state.
     * @returns {object} - Builder with setProp and build methods.
     * @throws {Error} If obj is not an object.
	*/
	var INITIAL_STATE_BUILDER = (obj) => {
		if(typeof obj !== "object") throw new Error("Illegal arguments.");
		var internal = (obj ?Object.assign({}, obj):{});
		return {

			/**
             * Builds the immutable initial state object.
             * @returns {object} Immutable initial state.
			*/
			build() {
				var initialState = Object.entries(internal).reduce((acc, entry ) => {
					var [fieldName, fieldValue] = entry;
					acc[fieldName] = _createField(fieldValue);
					return acc;
				},{});
				return Object.freeze(initialState);
			},

			/**
             * Sets a property or multiple properties in the state.
             * @param {string|object} param1 - Field name or object with multiple properties.
             * @param {string} [param2] - Field value (if param1 is a string).
			*/
			setProp(param1, param2) {
				const setInternalProp = (fieldName, fieldValue) => {
					var dup = internal[fieldName];
					if (dup) console.warn(`[${fieldValue}] will overwrite [${fieldName}]`);
					internal[fieldName] = fieldValue;
				};
			
				if (typeof param1 === "object") {
					Object.entries(param1).forEach(([key, value]) => setInternalProp(key, value));
				} else {
					setInternalProp(param1, param2);
				}
			}
			
		}
	}
	globalThis["MODEL_FACTORY"] = MODEL_FACTORY;
	globalThis["INITIAL_STATE_BUILDER"] = INITIAL_STATE_BUILDER;
})();