import React from 'react';
import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const HelpTextControl = ({ value, onChange }) => (
	<TextareaControl
		label={__('Help text for filling in', 'obatala')}
		value={value}
		onChange={onChange}
		placeholder={__('Enter help text to assist with filling in the field', 'obatala')}
	/>
);

export default HelpTextControl;
