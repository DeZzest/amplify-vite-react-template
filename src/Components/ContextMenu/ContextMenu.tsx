import React, { useEffect } from 'react';
import style from './ContextMenu.module.css';

interface ContextMenuProps {
	show: boolean;
	setShow: (value: boolean) => void;
	position: { x: number; y: number };
	save?: () => void;
	deleteMsg?: () => void;
	saveMsg?: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
	position,
	setShow,
	show,
	deleteMsg,
	save,
	saveMsg,
}) => {
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const menu = document.getElementById('context-menu');
			if (menu && !menu.contains(event.target as Node)) {
				setShow(false);
			}
		};

		if (show) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [show, setShow]);

	const handleCopy = (event: React.MouseEvent) => {
		event.stopPropagation();

		save!();
		setShow(false);
	};

	const handleDelete = (event: React.MouseEvent) => {
		event.stopPropagation();
		deleteMsg!();
		setShow(false);
	};

	const handleSaveMessage = (event: React.MouseEvent) => {
		event.stopPropagation();
		saveMsg!();
		setShow(false);
	};


	return (
		<>
			{show && (
				<div
					id="context-menu"
					className={style.menu}
					style={{
						top: position.y,
						left: position.x,
						display: show ? 'block' : 'none',
					}}
				>
					<div className={style.item} onClick={handleCopy}>
						Copy
					</div>
					{deleteMsg && (
						<div className={style.item} onClick={handleDelete}>
							Delete
						</div>
					)}
					{saveMsg && (
						<div className={style.item} onClick={handleSaveMessage}>
							Save
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default ContextMenu;
