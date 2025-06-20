# state_manager.py

class StateManager:
    def __init__(self):
        self.state = { "user_info": {

        },
                       "session_info": None,
                       "conversation_history": [],
                       "selected_doc": {},
                       "session_dict": {}
                       }

    def get_state(self):
        return self.state

    def update_state(self, new_state):
        self.state.update(new_state)
        return self.state

    def update_user_info(self, new_state):
        self.state.update(new_state)
        return self.state

    def update_session_info(self, new_state):
        self.state.update(new_state)
        return self.state

    def update_selected_doc(self, new_state):
        self.state.update(new_state)
        return self.state

    def update_session_dict(self, new_state):
        self.state.update(new_state)
        return self.state



# Create a single instance to be used throughout the app
state_manager = StateManager()
