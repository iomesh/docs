---
id: introduction
title: Introduction 
sidebar_label: Introduction
---

## What is IOMesh?

IOMesh is a distributed storage system specifically designed for Kubernetes workloads, providing reliable persistent storage for containerized stateful applications such as MySQL, Cassandra, and MongoDB. 

- Create or remove persistent volumes thousands of times per minute for Kubernetes pods. 
- Easy to operate and maintain. IOMesh is implemented on Kubernetes, so as long as you are familiar with Kubernetes, you will know how to manage and maintain IOMesh.
- Scale on demand. Deploy IOMesh with a small-size storage and scale storage by adding disks or nodes.

## Key Features 

### High Performance 

Databases leveraging IOMesh block storage have been tested to have lower read/write latency and higher QPS/TPS, ensuring stable operation of data services.

### Kernel Independent 
   
Running separately in user space instead of kernel space, IOMesh is isolated from other applications on the same node, which means that when IOMesh fails, other applications can deliver services as usual without causing the entire system to fail. Since IOMesh is kernel independent, you do not need to install any kernel modules or worry about kernel version compatibility issues.
   
### Tiered Storage

IOMesh supports mixed, tiered deployment of disks, including NVMe SSD, SATA SSD and HDD, maximizing storage resources and performance and minimizing storage costs.

## Architecture

![IOMesh arch](https://user-images.githubusercontent.com/78140947/122766241-e2352c00-d2d3-11eb-9630-bb5b428c3178.png)
