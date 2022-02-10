import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';

const Header = () => {

    return(
		<header class="header">
			<h1>Preact App</h1>
			<nav>
				<Link activeClassName={style.active} href="/EditSchema">Schema</Link>
				<Link activeClassName={style.active} href="/Viewer">Form</Link>
				<Link activeClassName={style.active} href="/List">List</Link>
			</nav>
		</header>
	);
};

export default Header;