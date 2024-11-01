import style from './ChatRoomHolder.module.css';

export const ChatRoomHolder = () => {
	return (
		<div className={style.room}>
			<h1 className={style.title}>Select a chat to communicate</h1>
		</div>
	);
};