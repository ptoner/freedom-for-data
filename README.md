# Solidity/IPFS Data Access Service

## About
A simple reusable data access pattern to tie an Ethereum smart contract to data stored in IPFS. 

This will allow DApps developers to more easily abstract these layers away.

Over time the Ethereum/IPFS implementation details can evolve and all the CRUD DApps we build won't be coupled so tightly to the rapidly changing implementation details.

# Usage
```

```



# Configurable
* IPFS gateway is configurable. You can have this be a setting chosen by the user in your app. 
    - It assumes localhost by default. 


## Tradeoffs You Make
* Anything you put in IPFS can theoretically be lost. 
    - If you are creating a financial transaction that is dependent on this data, this probably isn't the right pattern to use.
* You'll probably have to pay for IPFS hosting. 
    - Eventually I think this can be done via coin and the DApp itself can be in charge of paying for it. I'm not sure how feasible that is yet.
* There's some centralization risk in IPFS unless you make an effort (paid, probably) to get others to host the files. This should be mitigated over time.



### Includes 

* Solidity smart contract that provides a simple CRUD service to store records. 

* Ethereum will store:
    * The ID that was generated.
    * The IPFS cid where your actual data lives.
    * Which contract owns the record, if applicable.

    This keeps gas costs low. 


* IPFS will contain:
    * A JSON representation of your data. 

* UI and tests shouldn't care that it's a blockchain app.

* Your actual javascript app (React, Angular, whatever) won't care that it's dealing with a DApp. 
It's going to make very simple requests.