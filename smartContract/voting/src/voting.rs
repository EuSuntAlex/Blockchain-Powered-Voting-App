#![no_std]

multiversx_sc::imports!();
#[multiversx_sc::contract]

pub trait Voting {
    #[init]
    fn init(&self) {}

    
    #[endpoint]
    fn upgrade(&self){}

    #[endpoint]
    fn create_vote(&self, voting_deadline: u64, no_of_options: u64, vote_name: &ManagedBuffer) {
        require!(!self.voting_names().contains(vote_name), "Vote name taken");
        //let round = self.blockchain().get_block_round();
        self.deadline(vote_name.clone()).set(voting_deadline);
        self.number_of_options(vote_name.clone()).set(no_of_options);
        for _i in 1..(1 + no_of_options){
           self.voting_status(vote_name.clone()).push_back(0); 
        }
        self.vote_owner(vote_name.clone()).set(self.blockchain().get_caller());
        self.voting_names().insert(vote_name.clone());
    }
    // Func for adding vip with a bigger value
    #[endpoint]
    fn add_vip(&self, addr: ManagedAddress, value: u64 ,vote_name: &ManagedBuffer) {
        let _caller = self.blockchain().get_caller();
        let owner = self.vote_owner(vote_name.clone()).get();
        require!(
            _caller == owner,
            "Unauthorised Operation"
        );
        require!(!self.vip(vote_name.clone()).contains_key(&addr), "Vip already added!");
        self.vip(vote_name.clone()).insert(addr, value);
    } 
    /// Func pentru votare - ar trebui sa verifice dac persoana a votat deja
    #[endpoint]
    fn vote(&self, voting_index: u64,vote_name: &ManagedBuffer){
        let caller = self.blockchain().get_caller();
        require!(!self.participants(vote_name.clone()).contains(&caller), "You have already voted!");
        //check deadline
        // let round = self.blockchain().get_block_round();
        let current_timestamp = self.blockchain().get_block_timestamp();
        let ddl = self.deadline(vote_name.clone()).get();
        require!(ddl > current_timestamp , "Voting closed, ddl reached!");
        require!(self.number_of_options(vote_name.clone()).get() >= voting_index , "Voting number too high!");
        require!(voting_index > 0 , "Voting number too low!");
        let original_value = self.voting_status(vote_name.clone()).get_node_by_id(voting_index as u32);
        let mut voting_value = 1;
        if self.vip(vote_name.clone()).contains_key(&caller) { // if the user is a super voter, hist vote counts
            // more
            let aux = self.vip(vote_name.clone()).get(&caller);
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
                self.voting_status(vote_name.clone()).set_node_value_by_id(voting_index as u32, v + voting_value);
            }
            None => {}
        }
        
        self.participants(vote_name.clone()).insert(caller);
    }
    

    // will return the index of the highest voting option or u64::MAX if it is a draw.
    #[endpoint]
    fn calculate_result(&self,vote_name: &ManagedBuffer){
        let round = self.blockchain().get_block_round();
        let ddl = self.deadline(vote_name.clone()).get();
//        require!(ddl < round , "Voting still going!");
        let mut i = 0;
        let mut max = 0;
        let mut indx = 0;
        let mut apparitions = 0;
        let binding = self.voting_status(vote_name.clone());
        let node_it = binding.iter_from_node_id(1);
        for v in  node_it{
            i = i + 1; // for keeping track of possition
            let value = v.get_value_cloned(); //get value
            if value > max {
                max = value;
                indx = i;
                apparitions =  1;
            } else if value == max {
               apparitions += 1; 
            } 
        }
        if apparitions != 1 {
            self.result(vote_name.clone()).set(u64::MAX);
        } else {
            self.result(vote_name.clone()).set(indx);
        }
    }
    


    // returns the deadline date
    #[view(getDeadline)]
    #[storage_mapper("deadline")]
    fn deadline(&self, vote_name: ManagedBuffer) -> SingleValueMapper<u64>;


    // returns how many options there are 
    #[view(getNumberOfOptions)]
    #[storage_mapper("number_of_options")]
    fn number_of_options(&self, vote_name: ManagedBuffer) -> SingleValueMapper<u64>;


    // returns participants that voted
    #[view(getParticipants)]
    #[storage_mapper("participants")]
    fn participants(&self, vote_name: ManagedBuffer) -> UnorderedSetMapper<ManagedAddress>;


    // returns voting status
    #[view(getStatus)]
    #[storage_mapper("voting_status")]
    fn voting_status(&self, vote_name: ManagedBuffer) -> LinkedListMapper<u64>;

    #[view(getResult)]
    #[storage_mapper("result")]
    fn result(&self, vote_name: ManagedBuffer) -> SingleValueMapper<u64>;

    #[view(getVip)]
    #[storage_mapper("vip")]
    fn vip(&self, vote_name: ManagedBuffer) -> MapMapper<ManagedAddress, u64>;

    #[view(getvotingnames)]
    #[storage_mapper("voting_names")]
    fn voting_names(&self) -> UnorderedSetMapper<ManagedBuffer>;

    #[view(getVoteOwner)]
    #[storage_mapper("vote_owner")]
    fn vote_owner(&self, vote_name: ManagedBuffer) -> SingleValueMapper<ManagedAddress>;
}
