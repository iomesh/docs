---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

## Prerequisites

Before installing and deploying IOMesh, verify the following requirements.

### Kubernetes Cluster
- The Kubernetes cluster should have at least three worker nodes.
- The Kubernetes version should be between 1.17 and 1.24.

### Worker Node Hardware
Ensure each worker node has the following configurations.
|Hardware|Requirements|
|---|---|
|CPU|At least 6 cores|
|Memory|At least 12 GB|
|Physical Disks|<p>All-flash mode: No configuration is needed for cache disks; at least one SSD with an available capacity greater than 60 GB on each worker node.</p> <p>Hybrid-flash mode: For cache disks, at least one SSD with an available capacity greater than 60 GB; for data disk, at least one HDD with an available capacity greater than 60 GB on each worker node.
|Physical NIC|A physical NIC of 10 GBE for IOMesh storage network. |

## System Space Reservation

Verify that there is at least 100 GB of disk space in the `/opt` directory on each worker node to store IOMesh metadata.


