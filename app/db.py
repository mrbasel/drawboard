from redis import Redis


class RedisDbWrapper:
    def __init__(self):
        self.db = Redis()

    def create_room(self, room_id):
        self.db.rpush("rooms", room_id)

    def get_rooms(self):
        rooms = [i.decode("utf-8") for i in self.db.lrange("rooms", 0, -1)]
        return rooms

    def delete_room(self, room_id):
        self.db.delete(f"{room_id}:users_ids")
        self.db.lrem("rooms", 1, room_id)
        self.clear_board_state(room_id)

    def get_room_users(self, room_id):
        users = self.db.lrange(f"{room_id}:users_ids", 0, -1)
        return users
    
    def add_user(self, room_id, user_id):
        self.db.rpush(f"{room_id}:users_ids", user_id)

    def remove_user(self, room_id, user_id):
        self.db.lrem(f"{room_id}:users_ids", 1, user_id)

    def clear_board_state(self, room_id):
        self.db.delete(f"{room_id}:image")