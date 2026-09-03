import React from 'react';
import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const HelpTextControl = ({ value, onChange }) => (
	<TextareaControl
		label={__('Texto de ajuda para preenchimento', 'obatala')}
		value={value}
		onChange={onChange}
		placeholder={__('Digite um texto de ajuda para auxiliar no preenchimento do campo', 'obatala')}
	/>
);

export default HelpTextControl;
