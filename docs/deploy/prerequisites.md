---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

## Prerequisites

Verify the following requirements before installing and deploying IOMesh.

### Kubernetes Cluster
A Kubernetes cluster to run IOMesh should consist of at least three worker nodes, and the Kubernetes version should be between 1.17 and 1.24.

### Hardware for Each Worker Node
|Hardware|Requirements|
|---|---|
|CPU|At least 6 cores|
|Memory|At least 12 GB|
|Physical Disks|<p>All-flash mode: No configuration is needed for cache disks; At least one SSD with an available capacity greater than 60 GB on each worker node.</p> <p>Hybrid-flash mode: For cache disks, at least one SSD with an available capacity greater than 60 GB; for data disk, at least one HDD with an available capacity greater than 60 GB on each worker node.
|Physical NIC|A physical NIC of 10 GBE for IOMesh storage network. |

### System Space Reservation
On each worker node, make sure that at least 100 GB of disk space is reserved in the `/opt` directory for storing IOMesh cluster metadata.


