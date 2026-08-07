import React from 'react';
import { TextareaControl } from '@wordpress/components';

const HelpTextControl = ({ value, onChange }) => (
	<TextareaControl
		label="Texto de ajuda para preenchimento"
		value={value}
		onChange={onChange}
		placeholder="Informe um texto de ajuda para auxiliar no preenchimento do campo"
	/>
);

export default HelpTextControl;
