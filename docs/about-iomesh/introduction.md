---
id: introduction
title: Introduction
sidebar_label: Introduction
---

# What is IOMesh？

IOMesh is a distributed storage system specially designed for Kubernetes workloads, providing reliable persistent storage capabilities for containerized stateful applications such as MySQL, Cassandra, and MongoDB.

- Thousands of Pods are created and destroyed every minute in Kubernetes clusters. IOMesh is built for this kind of highly dynamic and large-scale workloads in the cloud-native era. It is designed with this in mind from the beginning to provide the performance, reliability, and scalability required by cloud-native applications.
- IOMesh runs natively on Kubernetes and fully utilizes the Kubernetes's capabilities. Therefore, the operation teams can leverage the standard Kubernetes APIs to uniformly manage the applications and IOMesh, which integrates perfectly with existing DevOps processes.
- IOMesh enables users to start at a small scale and expand the storage at will by adding disks or nodes.

## Key Features

### High Performance
   Database is one of the key applications to measure storage performance. IOMesh performes very well in the database performance benchmark tests with low and stable read/write latencies and high QPS/TPS, meaning to provide stable data services.
### No Kernel Dependencies
   IOMesh runs entirely in user space and can provide reliable services through effective software fault isolation. When a problem occurs, other applications running at the same node can continue to run without causing entire system crash. In addition, it is very easy to deploy and maintain IOMesh since you don't need to install any kernel modules and don't need to worry about kernel version compatibility at all.
### Storage Performance Tiering
   IOMesh supports flexible deployment of hybrid disks including NVMe SSD, SATA SSD and HDD. This can help users make the most of their storage investment, minimize the cost of each block while maximizing the storage performance.


