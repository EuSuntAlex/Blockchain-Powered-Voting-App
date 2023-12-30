#![no_std]

multiversx_sc::imports!();
#[multiversx_sc::contract]

pub trait Voting {
    #[init]
    fn init(&self, voting_deadline: u64, no_of_options: u64) {
        let round = self.blockchain().get_block_round();
        self.deadline().set(voting_deadline + round);
        self.number_of_options().set(no_of_options);
        for _i in 1..(1 + no_of_options){
           self.voting_status().push_back(0); 
        }
    }
    
    #[endpoint]
    fn upgrade(&self, _voting_deadline: u64, _no_of_options: u64){}

    /// Func pentru setarea numelui pentru votul valorilor idk daca folosim
    #[only_owner]
    #[endpoint]
    fn set_values(&self) {

    }


    // Func for adding vip with a bigger value
    #[only_owner]
    #[endpoint]
    fn add_vip(&self, addr: ManagedAddress, value: u64) {
        require!(!self.vip().contains_key(&addr), "Vip already added!");
        self.vip().insert(addr, value);
    } 
    /// Func pentru votare - ar trebui sa verifice dac persoana a votat deja
    #[endpoint]
    fn vote(&self, voting_value: u64){
        let caller = self.blockchain().get_caller();
        require!(!self.participants().contains(&caller), "You have already voted!");
        //check deadline
        let round = self.blockchain().get_block_round();
        let ddl = self.deadline().get();
        require!(ddl > round , "Voting closed, ddl reached!");
        require!(self.number_of_options().get() >= voting_value , "Voting number too high!");
        require!(voting_value > 0 , "Voting number too low!");
        let original_value = self.voting_status().get_node_by_id(voting_value as u32);
        let mut voting_value = 1;
        if self.vip().contains_key(&caller) { // if the user is a super voter, hist vote counts
            // more
            let aux = self.vip().get(&caller);
            match aux {
                Some(v) => {
                    voting_value = v; 
                }
                None => {}
            }
        }

        match original_value {
            Some(node) => {
                let v = node.into_value();
                self.voting_status().set_node_value_by_id(voting_value as u32, v + voting_value);
            }
            None => {}
        }
        
        self.participants().insert(caller);
    }
    

    // will return the index of the highest voting option or u64::MAX if it is a draw.
    #[endpoint]
    fn calculate_result(&self){
        let round = self.blockchain().get_block_round();
        let ddl = self.deadline().get();
        //require!(ddl < round , "Voting still going!");
        let mut i = 0;
        let mut max = 0;
        let mut indx = 0;
        let mut apparitions = 0;
        let binding = self.voting_status();
        let node_it = binding.iter_from_node_id(1);
        for v in  node_it{
            i = i + 1; // for keeping track of possition
            let value = v.get_value_cloned(); //get value
            sc_print!("{}", value);
            if value > max {
                max = value;
                indx = i;
                apparitions =  1;
            } else if value == max {
               apparitions += 1; 
            } 
        }
        sc_print!("max {} indx {} i {}", max, indx, i);
        if apparitions != 1 {
            self.result().set(u64::MAX);
        } else {
            self.result().set(indx);
        }
    }
    
    // resets the voting app
    // 
    #[only_owner]
    #[endpoint]
    fn reset_vote(&self, voting_deadline: u64, no_of_options: u64) {
        
        self.deadline().set(voting_deadline);
        self.number_of_options().set(no_of_options);
        self.participants().clear();
        self.voting_status().clear();
        self.names().clear();


    }


    // returns the deadline date
    #[view(getDeadline)]
    #[storage_mapper("deadline")]
    fn deadline(&self) -> SingleValueMapper<u64>;


    // returns how many options there are 
    #[view(getNumberOfOptions)]
    #[storage_mapper("number_of_options")]
    fn number_of_options(&self) -> SingleValueMapper<u64>;


    // returns the options names
    #[view(getNames)]
    #[storage_mapper("names")]
    fn names(&self) -> VecMapper<u8>;


    // returns participants that voted
    #[view(getParticipants)]
    #[storage_mapper("participants")]
    fn participants(&self) -> UnorderedSetMapper<ManagedAddress>;


    // returns voting status
    #[view(getStatus)]
    #[storage_mapper("voting_status")]
    fn voting_status(&self) -> LinkedListMapper<u64>;

    #[view(getResult)]
    #[storage_mapper("result")]
    fn result(&self) -> SingleValueMapper<u64>;

    #[view(getVip)]
    #[storage_mapper("vip")]
    fn vip(&self) -> MapMapper<ManagedAddress, u64>;
}

