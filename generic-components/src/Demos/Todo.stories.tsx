import {
    Box,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    useTheme
} from '@mui/material';
import {HCTextField} from '../HCTextField';
import React from 'react';
import {Meta, StoryObj} from '@storybook/react';
import {Delete} from '@mui/icons-material';
import {uuidv4} from '../utils';
import {HCButton} from '../HCButton';
import {HCCheckBox} from '../HCCheckBox';
import {HCRadioButton, HCRadioButtonOption} from '../HCRadioButton';

const meta = {
    title: 'Demos/TodoApp',
} satisfies Meta<unknown>;

export default meta;

type Story = StoryObj<unknown>;

interface Todo {
    id: string
    text: string
    completed?: boolean
}

export const TodoScreen: Story = {
    render() {
        const [filter, setFilter] = React.useState<HCRadioButtonOption>({
            id: 1,
            label: 'All'
        },);
        const theme = useTheme();
        const [todo, setTodo] = React.useState<string>('');
        const [todoError, setTodoError] = React.useState<boolean>(false);
        const [todos, setTodos] = React.useState<Todo[]>([
            {
                id: uuidv4(),
                text: 'Add more',
                completed: false,
            }
        ]);

        const filteredTodos = React.useMemo(() => {
            return todos.filter((item) => {
                if (filter.id === 1) return true;
                if (filter.id === 2) return item.completed;
                return !item.completed;
            });
        }, [filter, todos]);

        function addTodo() {
            if (todoError || todo.length < 1) {
                setTodoError(true);
                return;
            }
            setTodoError(false);
            setTodos([
                ...todos,
                {
                    completed: false,
                    id: uuidv4(),
                    text: todo
                }
            ]);
            setTodo('');
        }

        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 6,
                boxShadow: 1,
            }}>
                <Box sx={{
                    mb: 2
                }}>
                    <Typography variant={'h1'} sx={{
                        mb: 2
                    }}>ADD TODO</Typography>
                    <HCTextField required errorText={todoError ? 'Please enter some text!' : undefined} type={'text'} onChange={({ currentTarget }) => {
                        setTodo(currentTarget.value);
                        setTodoError(currentTarget.value.length <= 0);
                    }} value={todo} inputProps={{}} />
                    <HCButton hcVariant={'primary'} text={'ADD'} sx={{
                        borderRadius: 0,
                        ml: 1,
                        mt: 0.25
                    }} onClick={addTodo}/>
                </Box>
                <HCRadioButton hcType={{
                    type: 'group',
                    options: [
                        {
                            id: 1,
                            label: 'All'
                        },
                        {
                            id: 2,
                            label: 'Completed'
                        },
                        {
                            id: 3,
                            label: 'Not Completed'
                        }
                    ],
                    defaultValue: filter,
                    name: 'filter',
                    row: true
                }} hcVariant={'primary'} onRadioSelect={(_checked, item: HCRadioButtonOption) => {
                    setFilter(item);
                }} />
                <Box sx={{
                    my: 4,
                    borderColor: theme.hcPalette.primary['500']!['hex'],
                    p: 1,
                }}>
                    <Typography variant={'h1'} sx={{
                        mb: 2
                    }}>TODOS</Typography>
                    {filteredTodos.length === 0 ? (
                        <Typography>Please add some todos</Typography>
                    ) : (
                        <List>
                            {filteredTodos.map((item, index) => (
                                <ListItem key={item.id} disablePadding secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={() => {
                                        const newTodos = todos.filter((_i, ) => _i.id !== item.id);
                                        setTodos([...newTodos]);
                                    }}>
                                        <Delete />
                                    </IconButton>
                                }>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <HCCheckBox hcVariant={'primary'} hcType={{
                                                type: 'single',
                                                checked: item.completed,
                                            }} onCheckChange={(checked) => {
                                                const indexOf = todos.findIndex((i) => i.id === item.id);
                                                const newTodos = todos;
                                                console.log(item, indexOf);
                                                newTodos[index] = {
                                                    ...item,
                                                    completed: checked,
                                                };
                                                setTodos([...newTodos]);
                                            }} />
                                        </ListItemIcon>
                                        <ListItemText sx={{
                                            textDecoration: item.completed ? 'line-through' : ''
                                        }} primary={item.text} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>
        );
    }
};