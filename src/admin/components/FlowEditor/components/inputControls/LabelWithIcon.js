import React from 'react';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	edit,
	trash,
	paragraph,
	check,
	keyboard,
	calendar,
	link,
	commentEditLink,
	seen,
	listView,
	mobile,
	file,
	mapMarker,
	envelope,
	search,
} from '@wordpress/icons';

const IconForType = ( { type } ) => {
	const iconMapping = {
		text: paragraph, // Ícone para tipo de input texto
		edit: edit,
		checkbox: check,
		radio: listView,
		select: listView,
		number: keyboard,
		datepicker: calendar,
		email: envelope,
		url: link,
		textarea: commentEditLink,
		password: seen,
		phone: mobile,
		upload: file,
		stage_document: file,
		address: mapMarker,
		search: search,
	};

	const SelectedIcon = iconMapping[ type ]; // Pega o componente do ícone correspondente

	return SelectedIcon ? <Icon icon={ SelectedIcon } size={ 20 } /> : null;
};

const LabelWithIcon = ( { label, type } ) => {
	const normalizedLabel = typeof label === 'string' ? label.trim() : '';
	const displayLabel = normalizedLabel ? normalizedLabel : __( 'Untitled', 'obatala' );
	const isMissingTitle = !normalizedLabel;

	return (
		<>
			<span className="step-icon">
				<IconForType type={ type } />
			</span>
			<span className={ `step-label${ isMissingTitle ? ' false' : '' }` }>
				{ displayLabel }
			</span>
		</>
	);
};

export default LabelWithIcon;
